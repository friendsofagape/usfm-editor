import usfmSty from "./usfm.sty"
import { isStyleType } from "./StyleTypes"
import { MarkerInfo } from "./UsfmMarkers"

class InfoBuilder {
    private marker?: string = undefined
    private info: MarkerInfo = markerInfo()

    resetWithMarker(marker?: string) {
        this.marker = marker
        this.info = markerInfo()
    }
    getMarker(): string | undefined {
        return this.marker
    }
    setEndMarker(endMarker?: string) {
        this.info.endMarker = endMarker
    }
    setStyleType(styleType?: string) {
        const lower = styleType?.toLowerCase()
        if (lower && isStyleType(lower)) {
            this.info.styleType = lower
        } else {
            console.error("Unknown style type", styleType)
        }
    }
    setOccursUnder(occursUnder?: string[]) {
        this.info.occursUnder = occursUnder ?? []
    }
    setRank(rank?: number) {
        this.info.rank = rank
    }
    build(): MarkerInfo {
        return this.info
    }
}

const MarkerInfoMap: Map<string, MarkerInfo> = (() => {
    const map = new Map<string, MarkerInfo>()
    const lines = usfmSty.split("\n")
    const builder = new InfoBuilder()

    function recordFromBuilder() {
        const m = builder.getMarker()
        if (m) {
            map.set(m, builder.build())
        }
    }

    lines.forEach((line) => {
        if (line.startsWith("\\Marker")) {
            // We have completed a marker so add it to the map
            recordFromBuilder()
            const marker = line.match(/^\\Marker (.*)/)?.[1]
            builder.resetWithMarker(marker)
        } else if (line.startsWith("\\Endmarker")) {
            const endMarker = line.match(/^\\Endmarker (.*)/)?.[1]
            builder.setEndMarker(endMarker)
        } else if (line.startsWith("\\StyleType")) {
            const styleType = line.match(/^\\StyleType (.*)/)?.[1]
            builder.setStyleType(styleType)
        } else if (line.startsWith("\\OccursUnder")) {
            const occursUnder = line.match(/^\\OccursUnder (.*)/)?.[1]
            const array = occursUnder?.split(" ")
            builder.setOccursUnder(array)
        } else if (line.startsWith("\\Rank")) {
            const rank = line.match(/^\\Rank (.*)/)?.[1]
            const number = rank ? parseInt(rank) : undefined
            builder.setRank(number)
        }
    })
    recordFromBuilder()
    return map
})()

function markerInfo(): MarkerInfo {
    return {
        endMarker: undefined,
        styleType: undefined,
        occursUnder: new Array<string>(),
        rank: undefined,
    }
}

export default MarkerInfoMap
