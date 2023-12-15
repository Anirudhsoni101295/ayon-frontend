import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import BundleStatus from './BundleStatus/BundleStatus'
import { Button, Section, TablePanel } from '@ynput/ayon-react-components'
import useCreateContext from '/src/hooks/useCreateContext'
import confirmDelete from '/src/helpers/confirmDelete'

const AddonsManagerTable = ({
  header = '',
  isArchive = false,
  field = '',
  selection = [],
  value = [],
  onChange,
  onDelete,
  ...props
}) => {
  const deleteLabel = isArchive ? 'Archive' : 'Delete'
  const deleteIcon = isArchive ? 'archive' : 'delete'
  const tableSelection = value?.filter((d) => selection.includes(d && d[field]))

  const handleDelete = async (e, selected) => {
    e?.preventDefault()

    confirmDelete({
      label: header,
      message: (
        <ul>
          {selected.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ),
      accept: async () => await onDelete(selected),
      isArchive,
    })
  }

  const createContextItems = (selected, enabled) => {
    let items = []

    if (onDelete) {
      items.push({
        label: deleteLabel,
        icon: deleteIcon,
        disabled: !enabled,
        command: () => handleDelete(undefined, selected),
      })
    }
  }

  const [ctxMenuShow] = useCreateContext([])

  const handleContextClick = (e) => {
    let contextSelection = []
    // is new click not in original selection?
    if (!selection.includes(e.data[field])) {
      // then update selection to new click
      onChange([e.data[field]])
      contextSelection = [e.data[field]]
    } else {
      contextSelection = tableSelection.map((d) => d[field])
    }

    // check new selection is deletable
    const deleteEnabled =
      contextSelection.length &&
      contextSelection.every((d) => {
        const v = value.find((v) => v[field] === d)
        if (v) return !v.status.length
        return false
      })

    ctxMenuShow(e.originalEvent, createContextItems(contextSelection, deleteEnabled))
  }

  return (
    <Section style={{ height: '100%' }}>
      {onDelete && (
        <Button
          icon={deleteIcon}
          disabled={tableSelection.some((v) => v.status?.length)}
          onClick={(e) => handleDelete(e, selection)}
        >
          {deleteLabel} {header}
        </Button>
      )}
      <TablePanel style={{ height: '100%' }}>
        <DataTable
          {...props}
          value={value}
          scrollable
          scrollHeight="flex"
          selectionMode="multiple"
          onSelectionChange={(e) => onChange(e.value?.map((d) => d && d[field]))}
          selection={tableSelection}
          onContextMenu={handleContextClick}
        >
          <Column field={field} header={header} sortable />
          <Column
            field="status"
            header={'Status'}
            style={{ minWidth: 90, flex: 0 }}
            headerStyle={{ width: 50 }}
            body={(d) => <BundleStatus statuses={d.status} />}
            sortable
            sortFunction={(event) => {
              // sort by status length
              return event.data.sort((a, b) =>
                event.order === 1
                  ? b.status.length - a.status.length
                  : a.status.length - b.status.length,
              )
            }}
          />
        </DataTable>
      </TablePanel>
    </Section>
  )
}

export default AddonsManagerTable
