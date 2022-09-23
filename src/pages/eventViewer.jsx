import { useState, useEffect } from 'react'
import axios from 'axios'
import { DateTime } from 'luxon'

import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { TableWrapper } from '/src/components'

const EVENTS_QUERY = `
query Events {
    events(last: 100) {
      edges {
        node {
          id
          topic
          user
          project
          description
          updatedAt
        }
      }
    }
}
`

const EventViewer = () => {
  const [eventData, setEventData] = useState([])

  const loadEventData = () => {
    axios
      .post('/graphql', {
        query: EVENTS_QUERY,
        variables: {},
      })
      .then((response) => {
        if (!response.data?.data?.events) return

        let result = []
        for (const edge of response.data.data.events.edges) {
          result.push({
            id: edge.node.id,
            topic: edge.node.topic,
            user: edge.node.user,
            project: edge.node.project,
            description: edge.node.description,
            updatedAt: edge.node.updatedAt,
          })
        }
        setEventData(result)
      })
  }

  const handlePubSub = (topic, message) => {
    if (topic === 'client.reconnected') {
      loadEventData()
      return
    }
    setEventData((ed) => {
      return [message, ...ed]
    })
  }

  useEffect(() => {
    const token = PubSub.subscribe('*', handlePubSub)
    return () => PubSub.unsubscribe(token)
  }, [])

  useEffect(() => {
    loadEventData()
    // eslint-disable-next-line
  }, [])

  const formatTime = (rowData) => {
    return DateTime.fromSeconds(rowData.updatedAt).toRelative()
  }

  return (
    <main>
      <section style={{ flexGrow: 1 }}>
        <TableWrapper>
          <DataTable
            value={eventData}
            scrollable="true"
            scrollHeight="flex"
            responsive="true"
            dataKey="id"
          >
            <Column header="Time" body={formatTime} style={{ width: 200 }} />
            <Column header="Topic" field="topic" style={{ width: 200 }} />
            <Column header="User" field="user" style={{ width: 200 }} />
            <Column header="Project" field="project" style={{ width: 200 }} />
            <Column header="Description" field="description" />
          </DataTable>
        </TableWrapper>
      </section>
    </main>
  )
}

export default EventViewer