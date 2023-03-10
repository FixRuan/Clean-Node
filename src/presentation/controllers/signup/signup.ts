import { Controller, EmailValidator, HttpRequest, HttpResponse, AddAccount } from '../signup/signup-protocols'
import { MissingParamError, InvalidParamError } from '../../errors'
import { badRequest, serverError, created } from '../../helpers/http-helper'

export class SignUpController implements Controller {
  private readonly emailValidatorStub: EmailValidator
  private readonly addAccount: AddAccount

  constructor(emailValidatorStub: EmailValidator, addAccount: AddAccount) {
    this.emailValidatorStub = emailValidatorStub
    this.addAccount = addAccount
  }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const requiredFields = ['name', 'email', 'password', 'passwordConfirmation']

      for (const field of requiredFields) {
        if (!httpRequest.body[field]) {
          return badRequest(new MissingParamError(field))
        }
      }

      const { name, email, password, passwordConfirmation } = httpRequest.body

      if (password !== passwordConfirmation) {
        return badRequest(new InvalidParamError('passwordConfirmation'))
      }

      const isValid = this.emailValidatorStub.isValid(email)

      if (!isValid) {
        return badRequest(new InvalidParamError('email'))
      }

      const account = await this.addAccount.add({ name, email, password });

      return created(account)
    } catch (error) {
      return serverError()
    }
  }
}
