from fastapi import APIRouter
from .dark_web.routes import router as dark_web_router 
from .surface_web.routes import router as surface_web_router

# main api router
router = APIRouter(prefix="/api")


# include all of the other services routes

"""
router.include_router(auth)
router.include_router(users)
router.include_router(surface_web)
...
"""

router.include_router(dark_web_router)
router.include_router(surface_web_router) 