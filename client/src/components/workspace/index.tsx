import { useAppContext } from "@/context/AppContext"
import useResponsive from "@/hooks/useResponsive"
import { ACTIVITY_STATE } from "@/types/app"
import DrawingEditor from "../drawing/DrawingEditor"
import EditorComponent from "../editor/EditorComponent"

function WorkSpace() {
    const { viewHeight } = useResponsive()
    const { activityState } = useAppContext()

    return (
        <div
            className="flex w-full flex-col overflow-hidden px-[2px] pt-3 pb-3 md:h-full relative z-10"
            style={{ height: viewHeight }}
        >
            {activityState === ACTIVITY_STATE.DRAWING ? (
                <div key="drawing-view" className="flex flex-grow flex-col w-full bg-[#0d0d0d] rounded-2xl border border-white/5 shadow-2xl overflow-hidden shadow-black/40 relative animate-view-fade">
                    <DrawingEditor />
                </div>
            ) : (
                <div key="coding-view" className="flex flex-grow flex-col w-full h-full animate-view-fade">
                    <EditorComponent />
                </div>
            )}
        </div>
    )
}

export default WorkSpace
