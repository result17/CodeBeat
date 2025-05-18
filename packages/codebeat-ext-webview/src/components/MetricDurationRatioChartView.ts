import type { HeartbeatMetrics, MetricDurationData } from 'codebeat-server'
import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'
import IxProject from './IxProject.vue'
import RatioChart from './MetricDurationRatioChart.vue'

const validMetrics = new Set<HeartbeatMetrics>([
  'id',
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
    metricKey: {
      type: String as PropType<HeartbeatMetrics>,
      required: true,
    },
  },
  setup(props) {
    return () => {
      if (!validMetrics.has(props.metricKey)) {
        return null
      }

      return h('div', [
        h('div', { class: 'chart-title' }, [
          h(IxProject, {
            style: {
              transform: 'translateY(0.5px)',
            },
          }),
          h('span', props.metricKey),
        ]),
        h(RatioChart, {
          data: props.data,
          metricKey: props.metricKey,
        }),
      ])
    }
  },
})
