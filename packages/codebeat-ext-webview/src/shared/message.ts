export enum ICommand {
  summary_today_query = 'query_today_summary',
  summary_today_response = 'response_today_summary',
  metric_duration_project_query = 'query_metric_project_duration',
  metric_duration_project_response = 'response_metric_project_duration',
}

export interface IMessage<T> {
  message: ICommand
  data?: T
}
