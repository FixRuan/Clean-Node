import { HttpRequest, HttpResponse } from '../protocols/http'
import { Controller } from '../protocols/controller'

import { MissingParamError } from '../errors/missing-param-error'
import { badRequest, serverError } from '../helpers/http-helper'
import { EmailValidator } from '../protocols/email-validator'
import { InvalidParamError } from '../errors/invalid-param-error'

export class SignUpController implements Controller {
  private readonly emailValidatorStub: EmailValidator

  constructor(emailValidatorStub: EmailValidator) {
    this.emailValidatorStub = emailValidatorStub
  }

  handle(httpRequest: HttpRequest): HttpResponse {
    try {
      const requiredFields = ['name', 'email', 'password', 'passwordConfirmation']

      for (const field of requiredFields) {
        if (!httpRequest.body[field]) {
          return badRequest(new MissingParamError(field))
        }
      }

      const isValid = this.emailValidatorStub.isValid(httpRequest.body.email)

      if (!isValid) {
        return badRequest(new InvalidParamError('email'))
      }

      return {
        statusCode: 201,
        body: 'Created'
      }
    } catch (error) {
      return serverError()
    }
  }
}
