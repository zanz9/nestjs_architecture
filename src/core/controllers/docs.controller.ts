import { Controller, Get, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Response } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';

const DOCS_PATH = join(process.cwd(), 'src/core/docs');

@ApiExcludeController()
@Controller('docs')
export class DocsController {
  @Get('search')
  getSearchDocs(@Res() res: Response) {
    const html = readFileSync(join(DOCS_PATH, 'search.html'), 'utf8');
    res.type('html').send(html);
  }

  @Get('query')
  getQueryDocs(@Res() res: Response) {
    const html = readFileSync(join(DOCS_PATH, 'query.html'), 'utf8');
    res.type('html').send(html);
  }

  @Get('query.css')
  getQueryCss(@Res() res: Response) {
    const css = readFileSync(join(DOCS_PATH, 'query.css'), 'utf8');
    res.type('text/css').send(css);
  }
}
