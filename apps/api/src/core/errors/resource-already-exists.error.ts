import { DomainError, DomainErrorCode } from '#src/core/errors/domain.error.ts';

export type ResourceAlreadyExistsErrorProps = {
  resourceName: string;
  resourceId: string;
  code?: string;
};

export class ResourceAlreadyExistsError extends DomainError {
  readonly code: string;
  readonly resourceName: string;
  readonly resourceId: string;

  constructor(props: ResourceAlreadyExistsErrorProps, options?: ErrorOptions) {
    super(`${props.resourceName} '${props.resourceId}' already exists`, options);

    this.resourceName = props.resourceName;
    this.resourceId = props.resourceId;
    this.code = props.code ?? DomainErrorCode.ResourceAlreadyExists;
  }

  get details() {
    return { resourceName: this.resourceName, resourceId: this.resourceId };
  }
}
