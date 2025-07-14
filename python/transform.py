import os
import basyx.aas.model as model
import basyx.aas.model.datatypes as datatypes
from basyx.aas.adapter import aasx, json as basyx_json
from datetime import datetime


def create_submodel(line_name, machine_name, machine_data, link_name):
    submodel = model.Submodel(
        id_=f'https://{link_name}/{line_name}/{machine_name}',
        id_short=f'{machine_name}'
    )

    for sensor_name, sensor_info in machine_data.items():
        sensor_name = sensor_name.split("(")[0]

        time_series = model.SubmodelElementCollection(
            id_short=f'{sensor_name}_Time_Series',
        )

        for item in sensor_info['SN_Data']:
            # 데이터 타입 추론 개선
            value = item['Value']
            if isinstance(value, (int, float)):
                if isinstance(value, int):
                    # 큰 정수는 String으로 처리
                    if abs(value) > 2147483647:  # 32비트 정수 최대값
                        value_type = datatypes.String
                        value = str(value)
                    else:
                        value_type = datatypes.Int
                else:
                    # 큰 실수는 String으로 처리
                    if abs(value) > 1e308:  # double 최대값
                        value_type = datatypes.String
                        value = str(value)
                    else:
                        value_type = datatypes.Float
            else:
                value_type = datatypes.String
                value = str(value)

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
                            value=value
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


def transform_aas(path, data, link_name):
    aas_ids = []
    obj_store = model.DictObjectStore()
    basename = os.path.basename(path)

    for line_name, line_data in data.items():
        id_ = f'https://{link_name}/{line_name}'
        aas = model.AssetAdministrationShell(
            id_=id_,
            asset_information=model.AssetInformation(global_asset_id=line_name),
            submodel=set()
        )

        for machine_name, machine_data in line_data.items():
            submodel = create_submodel(line_name, machine_name, machine_data, link_name)
            aas.submodel.add(model.ModelReference.from_referable(submodel))
            obj_store.add(submodel)

        obj_store.add(aas)
        aas_ids.append(id_)

    # files 디렉토리와 aas 디렉토리 생성
    files_dir = '../files'
    aas_dir = '../files/aas'
    
    if not os.path.exists(files_dir):
        os.makedirs(files_dir, exist_ok=True)
    if not os.path.exists(aas_dir):
        os.makedirs(aas_dir, exist_ok=True)
    
    output_path = f'{aas_dir}/{basename}'
    basyx_json.write_aas_json_file(output_path, obj_store, indent=2)


def transform_aasx(path):
    file_store = aasx.DictSupplementaryFileContainer()
    obj_store = basyx_json.read_aas_json_file(path)

    filename = os.path.splitext(os.path.basename(path))[0]
    
    # files 디렉토리와 aasx 디렉토리 생성
    files_dir = '../files'
    aasx_dir = '../files/aasx'
    
    if not os.path.exists(files_dir):
        os.makedirs(files_dir, exist_ok=True)
    if not os.path.exists(aasx_dir):
        os.makedirs(aasx_dir, exist_ok=True)
    
    output_path = f'{aasx_dir}/{filename}.aasx'

    aas_ids = [
        aas.id for aas in obj_store
        if isinstance(aas, model.AssetAdministrationShell)
    ]

    with aasx.AASXWriter(output_path) as writer:
        writer.write_aas(
            aas_ids=aas_ids,
            object_store=obj_store,
            file_store=file_store
        )
