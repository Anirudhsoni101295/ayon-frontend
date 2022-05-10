import { useState, useEffect, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { DateTime } from 'luxon'

import axios from 'axios'

import { InputText, Spacer, Button, Shade } from '../../components'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'

import {
  setFocusedVersions,
  setSelectedVersions,
  setBreadcrumbs,
  setPairing,
} from '../../features/context'

import { SUBSET_QUERY, parseSubsetData, VersionList } from './subset-utils'

const Subsets = ({
  projectName,
  folders,
  focusedVersions,
  selectedVersions,
}) => {
  const dispatch = useDispatch()
  const [subsetData, setSubsetData] = useState([])
  const [selection, setSelection] = useState([])
  const [loading, setLoading] = useState(false)
  // const [selectedVersions, setSelectedVersions] = useState({})
  const [focusOnReload, setFocusOnReload] = useState(null)

  const columns = [
    {
      field: 'name',
      header: 'Subset',
      width: 200,
    },
    {
      field: 'folder',
      header: 'Folder',
      width: 200,
    },
    {
      field: 'family',
      header: 'Family',
      width: 120,
    },
    {
      field: 'versionList',
      header: 'Version',
      width: 70,
      body: (row) =>
        VersionList(row, (subsetId, versionId) => {
          const newSelection = selectedVersions[row.folderId] || {}
          newSelection[subsetId] = versionId
          dispatch(
            setSelectedVersions({
              ...selectedVersions,
              [row.folderId]: newSelection,
            })
          )
          setFocusOnReload(versionId)
        }),
    },
    {
      field: 'time',
      header: 'Time',
      width: 150,
      body: (row) => DateTime.fromSeconds(row.createdAt).toRelative(),
    },
    {
      field: 'author',
      header: 'Author',
      width: 120,
    },
    {
      field: 'frames',
      header: 'Frames',
      width: 120,
    },
  ]

  useEffect(() => {
    if (folders.length === 0) return

    // version overrides
    // Get a list of version overrides for the current set of folders
    let versionOverrides = []
    for (const folderId of folders) {
      const c = selectedVersions[folderId]
      if (!c) continue
      for (const subsetId in c) {
        const versionId = c[subsetId]
        if (versionOverrides.includes(versionId)) continue
        versionOverrides.push(versionId)
      }
    }
    if (versionOverrides.length === 0) {
      // We need at least one item in the array to filter.
      versionOverrides = ['00000000000000000000000000000000']
    }

    setLoading(true)
    axios
      .post('/graphql', {
        query: SUBSET_QUERY,
        variables: { folders, projectName, versionOverrides },
      })
      .then((response) => {
        if (!(response.data.data && response.data.data.project)) {
          toast.error('Unable to fetch subsets')
          return
        }
        setSubsetData(parseSubsetData(response.data.data))
      })
      .finally(() => {
        setLoading(false)
        if (focusOnReload) {
          dispatch(setFocusedVersions([focusOnReload]))
          setFocusOnReload(null)
        }
      })
    // eslint-disable-next-line
  }, [folders, projectName, selectedVersions])

  useEffect(() => {
    setSelection([
      ...subsetData.filter((s) => focusedVersions.includes(s.versionId)),
    ])
  }, [subsetData, focusedVersions])

  const taskList = useMemo(() => {
    const res = []
    for (const subset of subsetData) {
      if (subset.taskId) res.push(subset.taskId)
    }
    dispatch(setPairing(res))
    return res
    // eslint-disable-next-line
  }, [subsetData])

  return (
    <section className="invisible insplit">
      <section className="invisible row">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            style={{ width: '200px' }}
            placeholder="Filter subsets..."
            disabled={true}
          />
        </span>
        <Button
          icon="pi pi-list"
          tooltip="Mockup button"
          disabled={true}
          tooltipOptions={{ position: 'bottom' }}
        />
        <Button
          icon="pi pi-th-large"
          tooltip="Mockup button"
          disabled={true}
          tooltipOptions={{ position: 'bottom' }}
        />
        <Spacer />
        <Button
          icon="pi pi-lock"
          tooltip="Mockup button"
          disabled={true}
          tooltipOptions={{ position: 'bottom' }}
        />
        <Button
          icon="pi pi-sitemap"
          tooltip="Mockup button"
          disabled={true}
          tooltipOptions={{ position: 'bottom' }}
        />
        <Button
          icon="pi pi-star"
          tooltip="Mockup button"
          disabled={true}
          tooltipOptions={{ position: 'bottom' }}
        />
        <Button
          icon="pi pi-cog"
          tooltip="Mockup button"
          disabled={true}
          tooltipOptions={{ position: 'bottom' }}
        />
      </section>

      <section
        style={{
          flexGrow: 1,
          padding: 0,
        }}
      >
        <div className="wrapper">
          {loading && <Shade />}
          <DataTable
            scrollable
            responsive="true"
            resizableColumns
            columnResizeMode="expand"
            scrollDirection="both"
            scrollHeight="flex"
            responsiveLayout="scroll"
            value={subsetData}
            emptyMessage="No subset found"
            selectionMode="multiple"
            selection={selection}
            rowClassName={(row) => {
              let i = 0
              for (const taskId of taskList) {
                i++
                if (row.taskId === taskId) {
                  return `row-hl-${i}`
                }
              }
            }}
            onSelectionChange={(e) => {
              let selection = []
              let tasks = []
              for (let elm of e.value) {
                if (elm.versionId) selection.push(elm.versionId)
                if (elm.taskId) tasks.push(elm.taskId)
              }
              dispatch(setFocusedVersions(selection))
            }}
            onRowClick={(e) => {
              dispatch(
                setBreadcrumbs({
                  parents: e.data.parents,
                  folder: e.data.folder,
                  subset: e.data.name,
                  version: e.data.versionName,
                })
              )
            }}
          >
            {columns.map((col) => {
              return (
                <Column {...col} key={col.field} style={{ width: col.width }} />
              )
            })}
          </DataTable>
        </div>
      </section>
    </section>
  )
}

export default Subsets
