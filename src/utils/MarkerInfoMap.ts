import usfmSty from "./usfm.sty"
import { StyleType, isStyleType } from "./StyleTypes"
import { MarkerInfo } from "./UsfmMarkers"

class InfoBuilder {
    private marker: string = null
    private endMarker: string = null
    private styleType: StyleType = null
    private occursUnder: string[] = null
    private rank: number = null

    resetWithMarker(marker: string) {
        this.marker = marker
        this.endMarker = null
        this.styleType = null
        this.occursUnder = new Array<string>()
        this.rank = null
    }
    getMarker(): string {
        return this.marker
    }
    setEndMarker(endMarker: string) {
        this.endMarker = endMarker
    }
    setStyleType(styleType: string) {
        const lower = styleType.toLowerCase()
        if (isStyleType(lower)) {
            this.styleType = lower
        } else {
            console.error("Uknown style type", styleType)
        }
    }
    setOccursUnder(occursUnder: string[]) {
        this.occursUnder = occursUnder
    }
    setRank(rank: number) {
        this.rank = rank
    }
    build(): MarkerInfo {
        return {
            endMarker: this.endMarker,
            styleType: this.styleType,
            occursUnder: this.occursUnder,
            rank: this.rank,
        }
    }
}

const MarkerInfoMap: Map<string, MarkerInfo> = (() => {
    const map = new Map<string, MarkerInfo>()
    const lines = usfmSty.split("\n")
    const builder = new InfoBuilder()
    lines.forEach((line) => {
        if (line.startsWith("\\Marker")) {
            if (builder.getMarker()) {
                // We have completed a marker so add it to the map
                map.set(builder.getMarker(), builder.build())
            }
            const [, marker] = line.match(/^\\Marker (.*)/)
            builder.resetWithMarker(marker)
        } else if (line.startsWith("\\Endmarker")) {
            const [, endMarker] = line.match(/^\\Endmarker (.*)/)
            builder.setEndMarker(endMarker)
        } else if (line.startsWith("\\StyleType")) {
            const [, styleType] = line.match(/^\\StyleType (.*)/)
            builder.setStyleType(styleType)
        } else if (line.startsWith("\\OccursUnder")) {
            const [, occursUnder] = line.match(/^\\OccursUnder (.*)/)
            const array = occursUnder.split(" ")
            builder.setOccursUnder(array)
        } else if (line.startsWith("\\Rank")) {
            const [, rank] = line.match(/^\\Rank (.*)/)
            builder.setRank(parseInt(rank))
        }
    })
    map.set(builder.getMarker(), builder.build())
    return map
})()

export default MarkerInfoMap
