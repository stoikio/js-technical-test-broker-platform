import { DomainError, DomainErrorCode } from '#src/core/errors/domain.error.ts';

export type ResourceNotFoundErrorProps = {
  /** The kind of resource that was looked for, for example `Quote`. */
  resourceName: string;
  resourceId?: string;
  code?: string;
};

export class ResourceNotFoundError extends DomainError {
  readonly code: string;
  readonly resourceName: string;
  readonly resourceId?: string;

  constructor(props: ResourceNotFoundErrorProps, options?: ErrorOptions) {
    super(
      props.resourceId
        ? `${props.resourceName} '${props.resourceId}' not found`
        : `${props.resourceName} not found`,
      options,
    );

    this.resourceName = props.resourceName;
    this.resourceId = props.resourceId;
    this.code = props.code ?? DomainErrorCode.ResourceNotFound;
  }

  get details() {
    return { resourceName: this.resourceName, resourceId: this.resourceId };
  }
}
