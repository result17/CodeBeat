export enum ICommand {
  summary_today_query = 'query_today_summary',
  summary_today_response = 'response_today_summary',
}

export interface IMessage<T> {
  command: ICommand
  data?: T
}
