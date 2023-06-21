import json
import xml.etree.ElementTree as ET

def convert_json_to_xml(json_data):
    root = ET.Element('root')  # Create the root element for XML

    def traverse_dict(parent, data):
        if isinstance(data, dict):
            for key, value in data.items():
                if isinstance(value, (dict, list)):
                    elem = ET.SubElement(parent, key)
                    traverse_dict(elem, value)
                else:
                    elem = ET.SubElement(parent, key)
                    elem.text = str(value)
        elif isinstance(data, list):
            for item in data:
                elem = ET.SubElement(parent, 'item')
                traverse_dict(elem, item)

    traverse_dict(root, json_data)

    xml_data = ET.tostring(root, encoding='unicode')
    return xml_data

# File path to the JSON file
json_file_path = "sample.json"

# Read JSON data from the file
with open(json_file_path) as file:
    json_data = json.load(file)

# Convert JSON to XML
xml_data = convert_json_to_xml(json_data)

# Save XML to a file
xml_file_path = "output.xml"
with open(xml_file_path, 'w') as file:
    file.write(xml_data)

print(f"XML file saved at: {xml_file_path}")