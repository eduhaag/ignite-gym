export class MaxNumberOfCheckImsError extends Error {
  constructor() {
    super('Max number of check-ins reached.')
  }
}
