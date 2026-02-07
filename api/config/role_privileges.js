module.exports = {
    privGroups : [
        {
            id : "USERS",
            name : "Users Permissions"
        },
        {
            id : "ROLES",
            name : "Roles Permissions"
        },  
        {
            id : "CATEGORIES",
            name : "Categories Permissions"
        },
        {
            id : "AUDITLOGS",
            name : "Audit Logs Permissions"
        }
    ],
    priviliges : [
        {
            key : "user_view",
            name : "User View",
            group: "USERS",
            description :"Allows the user to view the list of users and their details."
        },
        {
            key : "user_add",
            name : "User Add", 
            group: "USERS",
            description :"Allows the user to add new users to the system."
        },
        {
            key : "user_update",   
            name : "User Update",
            group: "USERS",
            description :"Allows the user to update existing users' information."
        },
        {
            key : "user_delete",   
            name : "User Delete",
            group: "USERS",
            description :"Allows the user to delete users from the system."
        },
        {
            key : "roles_view",
            name : "Roles View",    
            group: "ROLES",
            description :"Allows the user to view the list of roles and their details."
        },
        {
            key : "roles_add",  
            name : "Roles Add",  
            group: "ROLES",
            description :"Allows the user to add new roles to the system."
        },
        {
            key : "roles_update",
            name : "Roles Update",
            group: "ROLES",
            description :"Allows the user to update existing roles' information."
        },
        {
            key : "roles_delete",
            name : "Roles Delete",
            group: "ROLES",
            description :"Allows the user to delete roles from the system."
        },
        {
            key : "categories_view",
            name : "Categories View",
            group: "CATEGORIES",
            description :"Allows the user to view the list of categories and their details."
        },
        {
            key : "categories_add", 
            name : "Categories Add",
            group: "CATEGORIES",
            description :"Allows the user to add new categories to the system."
        },
        {
            key : "categories_update",
            name : "Categories Update",
            group: "CATEGORIES",
            description :"Allows the user to update existing categories' information."
        },
        {
            key : "categories_delete",
            name : "Categories Delete",     
            group: "CATEGORIES",
            description :"Allows the user to delete categories from the system."
        },
        {
            key : "auditlogs_view", 
            name : "Audit Logs View",
            group: "AUDITLOGS",
            description :"Allows the user to view the list of audit logs and their details."
        }
    ]
};