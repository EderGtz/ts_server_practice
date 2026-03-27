export class AppError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number
    ) {
        super(message);
        this.name = new.target.name;
    };
};

export class BadRequestError extends AppError {
    constructor(message: string) {
        super(message, 400)
    }
}

export class UserNotAuthenticatedError extends AppError {
    constructor(message: string) {
        super(message, 401)
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string) {
        super(message, 401)
    }
}

export class UserForbiddenError extends AppError {
    constructor(message: string) {
        super(message, 403)
    }
}

export class NotFoundError extends AppError {
    constructor(message: string) {
        super(message, 404)
    }
}

export class InternalServerError extends AppError {
    constructor(message = "Something went wrong on our end") {
        super(message, 500);
    };
};