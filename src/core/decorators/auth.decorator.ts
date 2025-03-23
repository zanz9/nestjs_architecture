import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

export const Auth = () => {
  return applyDecorators(
    ApiBearerAuth('Authorization'),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
};
