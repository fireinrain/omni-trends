import type { FixedColumnID } from "@shared/types"
import { useTitle } from "react-use"
import { useTranslation } from "react-i18next"
import { NavBar } from "../navbar"
import { Waterfall } from "../waterfall"
import { Dnd } from "./dnd"
import { currentColumnIDAtom, viewModeAtom } from "~/atoms"

export function Column({ id }: { id: FixedColumnID }) {
  const [currentColumnID, setCurrentColumnID] = useAtom(currentColumnIDAtom)
  const viewMode = useAtomValue(viewModeAtom)
  const { t } = useTranslation()
  useEffect(() => {
    setCurrentColumnID(id)
  }, [id, setCurrentColumnID])

  useTitle(t("title.page", { name: t(`column.${id}`) }))

  return (
    <>
      <div className="flex justify-center md:hidden mb-6">
        <NavBar />
      </div>
      {id === currentColumnID && (viewMode === "waterfall" ? <Waterfall /> : <Dnd />)}
    </>
  )
}
