import { AnimatePresence, motion } from "framer-motion"
import { createPortal } from "react-dom"
import { useTranslation } from "react-i18next"
import {
  currentColumnIDAtom,
  currentSourcesAtom,
  currentVisibleSourcesAtom,
  setVisibleSourcesAtom,
  sourceFilterOpenAtom,
  toggleSourceVisibilityAtom,
} from "~/atoms"

/**
 * 最热/实时栏目的数据源展示设置。
 *
 * 选择结果保存在 localStorage（hiddenSourcesAtom），瀑布流和卡片模式共用
 * currentVisibleSourcesAtom，因此两者始终展示相同的范围。
 */
export function SourceFilter() {
  const currentColumnID = useAtomValue(currentColumnIDAtom)
  const allSources = useAtomValue(currentSourcesAtom)
  const visibleSources = useAtomValue(currentVisibleSourcesAtom)
  const toggleSource = useSetAtom(toggleSourceVisibilityAtom)
  const setVisibleSources = useSetAtom(setVisibleSourcesAtom)
  const [opened, setOpened] = useAtom(sourceFilterOpenAtom)
  const { t } = useTranslation()

  const customizable = currentColumnID === "hottest" || currentColumnID === "realtime"

  useEffect(() => {
    setOpened(false)
  }, [currentColumnID, setOpened])

  useEffect(() => {
    if (!opened) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpened(false)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [opened, setOpened])

  if (!customizable) return null

  const visibleSet = new Set(visibleSources)
  const allSelected = visibleSources.length === allSources.length

  return (
    <>
      <button
        type="button"
        title={t("customize.title")}
        className={$("btn i-ph:sliders-horizontal-duotone", !allSelected && "color-primary-600 dark:color-primary")}
        onClick={() => setOpened(true)}
      />
      {createPortal(
        <AnimatePresence>
          {opened && (
            <motion.div
              className="fixed inset-0 z-999 flex items-center justify-center bg-black/40 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpened(false)}
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={t("customize.title")}
                className="sprinkle-primary w-full max-w-lg rounded-2xl border border-neutral-400/10 bg-base p-4 shadow-2xl"
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
                transition={{ duration: 0.18 }}
                onClick={event => event.stopPropagation()}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="i-ph:sliders-horizontal-duotone text-xl color-primary-600 dark:color-primary" />
                  <span className="text-lg font-bold">{t("customize.title")}</span>
                  <button
                    type="button"
                    className="btn i-ph:x-bold ml-auto"
                    title={t("customize.close")}
                    onClick={() => setOpened(false)}
                  />
                </div>
                <p className="mb-3 text-xs op-60">
                  {t("customize.desc", { column: t(`column.${currentColumnID}`) })}
                </p>
                <div className="mb-3 flex items-center gap-2 text-xs">
                  <span className="op-60">
                    {t("customize.selected", { count: visibleSources.length, total: allSources.length })}
                  </span>
                  <span className="ml-auto inline-flex gap-1">
                    <button
                      type="button"
                      className="rounded-full px-2 py-1 transition-all hover:bg-neutral-400/10 disabled:op-30"
                      disabled={allSelected}
                      onClick={() => setVisibleSources(allSources)}
                    >
                      {t("customize.selectAll")}
                    </button>
                    <button
                      type="button"
                      className="rounded-full px-2 py-1 transition-all hover:bg-neutral-400/10 disabled:op-30"
                      disabled={!visibleSources.length}
                      onClick={() => setVisibleSources([])}
                    >
                      {t("customize.clear")}
                    </button>
                  </span>
                </div>
                <div className="max-h-[55vh] overflow-y-auto pr-1">
                  {allSources.map((id) => {
                    const selected = visibleSet.has(id)
                    return (
                      <button
                        key={id}
                        type="button"
                        className={$(
                          "mb-1 flex w-full items-center gap-3 rounded-lg p-2 text-left transition-all",
                          "hover:bg-neutral-400/10",
                          !selected && "op-45",
                        )}
                        onClick={() => toggleSource(id)}
                      >
                        <span
                          className="h-6 w-6 shrink-0 rounded-full bg-cover"
                          style={{
                            backgroundImage: `url(${import.meta.env.BASE_URL}icons/${id.split("-")[0]}.png)`,
                          }}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm">{sources[id].name}</span>
                          {sources[id].title && (
                            <span className="block truncate text-xs op-50">
                              {t(`source.title.${id}`, { defaultValue: sources[id].title })}
                            </span>
                          )}
                        </span>
                        <span className={$(
                          "shrink-0 text-lg",
                          selected ? "i-ph:check-circle-fill color-primary-600 dark:color-primary" : "i-ph:circle op-30",
                        )}
                        />
                      </button>
                    )
                  })}
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    className="rounded-full bg-primary-600 px-5 py-1.5 text-sm text-white transition-all hover:bg-primary-500"
                    onClick={() => setOpened(false)}
                  >
                    {t("customize.done")}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  )
}
