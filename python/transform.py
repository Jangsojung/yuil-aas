import basyx.aas.model as model
import basyx.aas.model.datatypes as datatypes
import basyx.aas.adapter.json as json
import os

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


aas_ids = []
obj_store = model.DictObjectStore()


def transform_aas(path, data):
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

    json.write_aas_json_file(f'../files/aas/{basename}', obj_store, indent=2)
