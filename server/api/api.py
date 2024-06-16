from fastapi import APIRouter

# main api router
router = APIRouter(prefix='/api')


# include all of the other services routes 

"""
router.include_router(auth)
router.include_router(users)
router.include_router(service1)
...
"""
