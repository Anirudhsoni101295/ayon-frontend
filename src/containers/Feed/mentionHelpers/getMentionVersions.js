import { getFuzzyDate } from '/src/components/Feed/ActivityDate'

const getMentionVersions = (versions) =>
  versions.map((v) => ({
    type: 'version',
    label: v.name,
    image: v.thumbnailId,
    icon: 'layers',
    id: v.id,
    createdAt: v.createdAt,
    context: v.product?.name,
    keywords: [v.name, v.product?.name],
    suffix: getFuzzyDate(v.createdAt),
  }))

export default getMentionVersions
