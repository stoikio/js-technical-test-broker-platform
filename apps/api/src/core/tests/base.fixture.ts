import { expect } from 'vitest';

import { StubClock } from '#src/core/infra/adapters/clock.stub.ts';
import { StubIdGenerator } from '#src/core/infra/adapters/id-generator.stub.ts';

export abstract class BaseFixture {
  protected readonly clock = new StubClock();
  protected readonly idGenerator = new StubIdGenerator();
  protected thrownError: unknown = null;

  givenNowIs(now: Date) {
    this.clock.currentDate = now;
  }

  givenTheNextIdsAre(...ids: string[]) {
    this.idGenerator.ids = ids;
  }

  /** Runs `action`, keeping its error for a later `thenItShouldFailWith`. */
  protected async capture<T>(action: () => Promise<T>) {
    this.thrownError = null;
    try {
      return await action();
    } catch (error) {
      this.thrownError = error;
      return null;
    }
  }

  thenItShouldFailWith(
    errorClass: abstract new (...args: never[]) => Error,
    expected?: { code?: string },
  ) {
    expect(this.thrownError).toBeInstanceOf(errorClass);
    if (expected?.code) {
      expect(this.thrownError).toMatchObject({ code: expected.code });
    }
  }

  thenItShouldSucceed() {
    expect(this.thrownError).toBeNull();
  }
}
