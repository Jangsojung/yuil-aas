import os
import basyx.aas.model as model
import basyx.aas.model.datatypes as datatypes
from basyx.aas.adapter import aasx, json as basyx_json
from datetime import datetime


def create_submodel(line_name, machine_name, machine_data):
    submodel = model.Submodel(
        id_=f'https://sambo.com/{line_name}/{machine_name}',
        id_short=f'{machine_name}'
    )

    for sensor_name, sensor_info in machine_data.items():
        sensor_name = sensor_name.split("(")[0]

        time_series = model.SubmodelElementCollection(
            id_short=f'{sensor_name}_Time_Series',
        )

        for item in sensor_info['SN_Data']:
            value_type_str = type(item['Value']).__name__.capitalize()
            value_type = getattr(datatypes, value_type_str, None)

            time_series.value.add(
                model.SubmodelElementCollection(
                    id_short=f'{sensor_name}_{item["Timestamp"]}',
                    value=[
                        model.Property(
                            id_short='timestamp',
                            value_type=datatypes.DateTime,
                            value=datetime.strptime(item['Timestamp'], '%Y%m%d_%H%M%S'),
                        ),
                        model.Property(
                            id_short='value',
                            value_type=value_type,
                            value=item['Value']
                        ),
                    ]
                )
            )

        submodel.submodel_element.add(time_series)
        submodel.submodel_element.add(
            model.Property(
                id_short=f'{sensor_name}_Unit',
                value_type=datatypes.String,
                value=sensor_info['Unit']
            )
        )

    return submodel


def transform_aas(path, data):
    aas_ids = []
    obj_store = model.DictObjectStore()
    basename = os.path.basename(path)

    for line_name, line_data in data.items():
        id_ = f'https://sambo.com/{line_name}'
        aas = model.AssetAdministrationShell(
            id_=id_,
            asset_information=model.AssetInformation(global_asset_id=line_name),
            submodel=set()
        )

        for machine_name, machine_data in line_data.items():
            submodel = create_submodel(line_name, machine_name, machine_data)
            aas.submodel.add(model.ModelReference.from_referable(submodel))
            obj_store.add(submodel)

        obj_store.add(aas)
        aas_ids.append(id_)

    basyx_json.write_aas_json_file(f'../files/aas/{basename}', obj_store, indent=2)


def transform_aasx(path):
    file_store = aasx.DictSupplementaryFileContainer()
    obj_store = basyx_json.read_aas_json_file(path)

    filename = os.path.splitext(os.path.basename(path))[0]

    aas_ids = [
        aas.id for aas in obj_store
        if isinstance(aas, model.AssetAdministrationShell)
    ]

    with aasx.AASXWriter(f'../files/aasx/{filename}.aasx') as writer:
        writer.write_aas(
            aas_ids=aas_ids,
            object_store=obj_store,
            file_store=file_store
        )
