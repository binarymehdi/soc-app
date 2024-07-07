from elasticsearch import Elasticsearch

# Connect to the Elasticsearch instance
es = Elasticsearch(["http://localhost:9200"])

# Check if the connection is established
if es.ping():
    print("Connected to Elasticsearch")
else:
    print("Could not connect to Elasticsearch")

# Define the index name
index_name = "my_index"

# Create an index
if not es.indices.exists(index=index_name):
    es.indices.create(index=index_name)
    print(f"Index '{index_name}' created")
else:
    print(f"Index '{index_name}' already exists")

# Define a document to be indexed
doc = {
    "name": "John Doe",
    "age": 30,
    "location": "New York"
}

# Index the document
res = es.index(index=index_name, id=1, body=doc)
print(f"Document indexed: {res['result']}")

# Retrieve the document to verify
retrieved_doc = es.get(index=index_name, id=1)
print(f"Retrieved document: {retrieved_doc['_source']}")
