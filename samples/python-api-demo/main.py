from fastapi import FastAPI

app = FastAPI(title="Sample Python Microservice")

@app.get("/")
def read_root():
    # TODO: Implement token verification middleware
    return {"message": "Hello World"}
