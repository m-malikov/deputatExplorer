import json


with open("www/regions.json") as json_file:
    regions_list = json.load(json_file)
    regions_dict = {}
    for region in regions_list:
        _id = region['id']
        name = region['name'].lower()
        regions_dict[name] = _id


with open("www/map/russia_compressed.json") as json_file:
    russia_compressed = json.load(json_file)

    russia_compressed_dict = {}
    russia_compressed_list = russia_compressed['features']
    for region in russia_compressed['features']:
        region_properties = region['properties']
        name = region_properties['main_name'].lower()
        if name not in regions_dict:
            region_properties['id'] = 1000
        else:
            region_properties['id'] = regions_dict[name]


with open('www/map/russia_compressed_mapped.json', 'w', encoding='utf-8') as f:
    json.dump(russia_compressed, f, ensure_ascii=False)
