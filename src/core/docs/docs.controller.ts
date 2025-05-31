import { Controller, Get, Res } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { Response } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';

const DOCS_PATH = join(process.cwd(), 'src/core/docs');

@Controller('docs')
export class DocsController {
  @ApiExcludeEndpoint()
  @Get('query')
  getQueryDocs(@Res() res: Response) {
    const html = readFileSync(join(DOCS_PATH, 'query.html'), 'utf8');
    res.type('html').send(html);
  }

  @ApiExcludeEndpoint()
  @Get('query.css')
  getQueryCss(@Res() res: Response) {
    const css = readFileSync(join(DOCS_PATH, 'query.css'), 'utf8');
    res.type('text/css').send(css);
  }
}
