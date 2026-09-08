import { IsEnum } from 'class-validator';

export enum OrderPatchAction {
  CONFIRM = 'CONFIRM',
  PROCESS = 'PROCESS',
  CANCEL = 'CANCEL',
  REFUND = 'REFUND',
  SHIP = 'SHIP',
  DELIVER = 'DELIVER',
}

export class OrderUpdateRequestDto {
  @IsEnum(OrderPatchAction)
  patchAction!: OrderPatchAction;
}
