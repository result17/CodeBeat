export enum ICommand {
  summary_today_query = 'query_today_summary',
  summary_today_response = 'response_today_summary',
  metric_duration_project_query = 'query_duration',
  metric_duration_response = 'response_duration',
}

export interface IMessage<T> {
  command: ICommand
  data?: T
}
