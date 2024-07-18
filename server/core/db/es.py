from elasticsearch import AsyncElasticsearch, NotFoundError, RequestError
import os
from pprint import pprint
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

es_host = os.getenv("ELASTICSEARCH_HOST", "localhost")
es_port = os.getenv("ELASTICSEARCH_PORT", "9200")

class Search:
    def __init__(self):
        self.es = AsyncElasticsearch(hosts=[f"http://{es_host}:{es_port}"])
        
    async def get_info(self):
        try:
            client_info = await self.es.info()
            print('Connected to Elasticsearch!')
            pprint(client_info)
        except Exception as e:
            print(f"Error connecting to Elasticsearch: {e}")
            
    async def index_exists(self, index_name):
        return await self.es.indices.exists(index=index_name)

    async def create_index(self, index_name):
        return await self.es.indices.create(index=index_name)

    async def bulk_index(self, actions):
        return await self.es.bulk(body=actions)
