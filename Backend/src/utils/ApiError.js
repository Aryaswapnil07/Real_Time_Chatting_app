class ApiError extends Error { // built in class of js as "error "
    constructor(
        statusCode,
        message= "Something went wrong",
        errors = [],
        stack = ""
    ){ // this above constructor called when ever NewApierror called in codebase
        super(message) // to treat as a parent constructor
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false; // here false is written because apierror means failure
        this.errors = errors

        if (stack) {
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

export {ApiError} // ApiError and asyncHandler work together

//  according to chatgpt in almost every controller function

/*
200 → Success
201 → Created
400 → Bad Request
401 → Unauthorized
403 → Forbidden
404 → Not Found
500 → Internal Server Error
*/