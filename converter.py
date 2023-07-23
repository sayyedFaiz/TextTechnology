import json
import xml.etree.ElementTree as ET
# XSD Schema
xsd_schema = """<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
    <xs:element name="root">
        <xs:complexType>
            <xs:sequence>
                <xs:element name="_id" type="xs:string" />
                <xs:element name="symbol" type="xs:string" />
                <xs:element name="price" type="xs:string" />
                <xs:element name="dayHigh" type="xs:string" />
                <xs:element name="dayLow" type="xs:string" />
                <xs:element name="__v" type="xs:string" />
            </xs:sequence>
        </xs:complexType>
    </xs:element>
</xs:schema>"""

def convert_json_to_xml(json_data, xsd_schema):
    root = ET.Element("root")  # Create the root element for XML
    # Parse the XSD schema to extract element names and types
    xsd_root = ET.fromstring(xsd_schema)
    xsd_elements = {
        elem.get("name"): elem.get("type")
        for elem in xsd_root.findall(
            ".//xs:element", namespaces={"xs": "http://www.w3.org/2001/XMLSchema"}
        )
    }

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
                elem = ET.SubElement(parent, "item")
                traverse_dict(elem, item)

    traverse_dict(root, json_data)
    # Add xsi and noNamespaceSchemaLocation attributes to the root element
    root.set("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance")
    root.set("xsi:noNamespaceSchemaLocation", "output.xsd")
    xml_data = ET.tostring(root, encoding="unicode")
    return xml_data


# File path to the JSON file
json_file_path = "sample.json"

# Read JSON data from the file
with open(json_file_path) as file:
    json_data = json.load(file)

# Convert JSON to XML
xml_data = convert_json_to_xml(json_data, xsd_schema)

# Save XML to a file
xml_file_path = "output.xml"
with open(xml_file_path, "w") as file:
    file.write(xml_data)

print(f"XML file saved at: {xml_file_path}")
