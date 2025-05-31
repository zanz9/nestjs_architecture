import { Controller, Post, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { AuthResultDto } from '../dto/auth_result.dto';

@ApiTags('Авторизация')
@Controller('auth')
export class AuthDevController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('generate-tokens/:userId')
  @ApiOperation({ summary: 'Генерация токенов по userId (только DEV)' })
  @ApiResponse({
    status: 200,
    description: 'Сгенерированные токены',
    type: AuthResultDto,
  })
  async generateTokensByUserId(@Param('userId', ParseIntPipe) userId: number) {
    const tokens = await this.authService.generateTokensByUserId(userId);
    await this.tokenService.setAccessTokenToWhiteList(tokens.accessToken);
    await this.tokenService.setRefreshTokenToWhiteList(tokens.refreshToken);
    return tokens;
  }
}
