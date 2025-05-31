import type { HeartbeatMetrics, MetricDurationData } from 'codebeat-server'
import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'
import IxProject from './IxProject.vue'
import RatioChart from './MetricDurationRatioChart.vue'

const validMetrics = new Set<HeartbeatMetrics>([
  'entity',
  'language',
  'cursorpos',
  'lineno',
  'lines',
  'project',
  'projectPath',
  'userAgent',
])

export default defineComponent({
  props: {
    data: {
      type: Object as PropType<MetricDurationData<HeartbeatMetrics>>,
      required: true,
    },
    metric: {
      type: String as PropType<HeartbeatMetrics>,
      required: true,
    },
  },
  setup(props) {
    return () => {
      if (!validMetrics.has(props.metric)) {
        return null
      }

      if (!props.data && props.metric === 'project') {
        return h('div', { class: 'chart-title' }, [
          h(IxProject, {
            style: {
              transform: 'translateY(0.5px)',
            },
          }),
          h('span', props.metric),
        ])
      }

      if (props.data && props.metric === 'project') {
        return h('div', [
          h('div', { class: 'chart-title' }, [
            h(IxProject, {
              style: {
                transform: 'translateY(0.5px)',
              },
            }),
            h('span', 'Project'),
          ]),
          h(RatioChart, {
            data: props.data,
            metric: props.metric,
          }),
        ])
      }
      return null
    }
  },
})
