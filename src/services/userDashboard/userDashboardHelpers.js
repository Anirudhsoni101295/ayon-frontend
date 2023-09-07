const getVersionThumbnailUrl = (version, projectName, accessToken) => {
  return version?.thumbnailId
    ? `/api/projects/${projectName}/thumbnails/${version?.thumbnailId}?updatedAt=${version.updatedAt}&token=${accessToken}`
    : null
}

export const transformTasksData = ({ projectName, tasks = [] }) =>
  tasks?.map((task) => {
    const latestVersion = task.versions?.edges[0]?.node

    const accessToken = localStorage.getItem('accessToken')

    const thumbnailUrl = getVersionThumbnailUrl(latestVersion, projectName, accessToken)

    const allVersions =
      task?.allVersions?.edges.map(({ node }) => ({
        ...node,
        thumbnailUrl: getVersionThumbnailUrl(node, projectName, accessToken),
      })) || []

    return {
      id: task.id,
      name: task.name,
      status: task.status,
      taskType: task.taskType,
      assignees: task.assignees,
      updatedAt: task.updatedAt,
      folderName: task.folder?.name,
      folderId: task.folderId,
      path: task.folder?.path,
      projectName: projectName,
      latestVersionId: latestVersion?.id,
      latestVersionThumbnailId: latestVersion?.thumbnailId,
      thumbnailUrl,
      allVersions,
    }
  })

export const taskProvideTags = (result, type = 'task') =>
  result
    ? [...result.map(({ id }) => ({ type, id })), { type, id: 'TASKS' }]
    : [{ type, id: 'TASKS' }]
