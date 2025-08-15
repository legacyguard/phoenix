import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { ProblemDetailsDto } from '../dto/problem-details.dto';

export function ApiErrorResponses() {
  const schema = { $ref: getSchemaPath(ProblemDetailsDto) };
  return applyDecorators(
    ApiExtraModels(ProblemDetailsDto),
    ApiBadRequestResponse({ schema }),
    ApiUnauthorizedResponse({ schema }),
    ApiForbiddenResponse({ schema }),
    ApiNotFoundResponse({ schema }),
    ApiConflictResponse({ schema }),
    ApiInternalServerErrorResponse({ schema }),
  );
}
