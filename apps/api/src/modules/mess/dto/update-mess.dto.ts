import { PartialType } from '@nestjs/swagger';
import { SetupMessDto } from './setup-mess.dto';

export class UpdateMessDto extends PartialType(SetupMessDto) {}
