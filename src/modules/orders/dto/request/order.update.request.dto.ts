export enum OrderPatchAction {
  CONFIRM = 'CONFIRM',
  PROCESS = 'PROCES',
  CANCEL = 'CANCEL',
  REFUND = 'REFUND',
  SHIP = 'SHIP',
  DELIVER = 'DELIVER',
}

export class OrderUpdateRequestDto {
  patchAction!: OrderPatchAction;
}
