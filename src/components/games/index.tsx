import { Suspense, useMemo, useState } from "react"
import { useRecoilCallback, useRecoilValue } from "recoil"
import { useCategoryLookup } from "../../hooks/useCategoryLookup"
import { useSaveScroll } from "../../hooks/useSaveScroll"
import {
  fileSystemInvalidationAtom,
  inventoryInvalidationAtom,
} from "../../recoil/atoms"
import { CateogryListselector } from "../../recoil/inventory/selectors"
import { coresListSelector } from "../../recoil/selectors"
import { Controls } from "../controls"
import { Grid } from "../grid"
import { Loader } from "../loader"
import { CoreFolderItem } from "./item"

export const Games = () => {
  const coresList = useRecoilValue(coresListSelector)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [filterCategory, setFilterCategory] = useState<string>("All")
  const lookupCategory = useCategoryLookup()

  const refresh = useRecoilCallback(({ set }) => () => {
    set(inventoryInvalidationAtom, Date.now())
    set(fileSystemInvalidationAtom, Date.now())
  })

  const sortedList = useMemo(
    () =>
      [...coresList]
        .sort((a, b) => {
          const [authorA, coreA] = a.split(".")
          const switchedA = `${coreA}.${authorA}`

          const [authorB, coreB] = b.split(".")
          const switchedB = `${coreB}.${authorB}`

          return switchedA.localeCompare(switchedB)
        })
        .filter((core) => {
          if (filterCategory === "All") return true
          return lookupCategory(core) === filterCategory
        })
        .filter((core) =>
          core.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    [searchQuery, filterCategory, coresList]
  )

  const categoryList = useRecoilValue(CateogryListselector)

  return (
    <div>
      <Controls
        controls={[
          {
            type: "search",
            text: "Search",
            value: searchQuery,
            onChange: (v) => setSearchQuery(v),
          },
          {
            type: "button",
            text: "Refresh",
            onClick: refresh,
          },
          {
            type: "select",
            options: categoryList,
            selected: filterCategory,
            text: "Category",
            onChange: (v) => setFilterCategory(v),
          },
        ]}
      />
      <Grid>
        {sortedList.map((core) => (
          <Suspense fallback={<Loader />} key={core}>
            <CoreFolderItem coreName={core} />
          </Suspense>
        ))}
      </Grid>
    </div>
  )
}
