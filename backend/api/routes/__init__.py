def register_routes(api):
    from api.routes.auth import register_auth_routes
    from api.routes.users import register_user_routes
    from api.routes.courses import register_course_routes
    from api.routes.groups import register_group_routes
    from api.routes.matching import register_matching_routes
    
    register_auth_routes(api)
    register_user_routes(api)
    register_course_routes(api)
    register_group_routes(api)
    register_matching_routes(api)