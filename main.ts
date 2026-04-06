// @ts-nocheck
//% color=#1E90FF weight=100 icon="\uf544"
//% block="AI"
namespace ai {

    /**
     * 감지할 대상 종류
     */
    export const enum ScanTarget {
        //% block="플레이어"
        Player = 0,
        //% block="동물"
        Animal = 1,
        //% block="몬스터"
        Monster = 2,
        //% block="전체"
        All = 3
    }

    function getTargetSelector(scanTarget: ScanTarget): TargetSelector {
        if (scanTarget == ScanTarget.Player) return mobs.target(ALL_PLAYERS)
        if (scanTarget == ScanTarget.Animal) return mobs.target(ANIMALS)
        if (scanTarget == ScanTarget.Monster) return mobs.target(MONSTERS)
        return mobs.target(ALL_ENTITIES)
    }

    /**
     * 에이전트 주변에서 엔티티를 감지합니다.
     */
    //% blockId=ai_scan_near_agent
    //% block="에이전트 주변 반경 $radius 칸에서 $scanTarget 감지"
    //% radius.defl=3 radius.min=1 radius.max=10
    //% weight=200
    export function scanNearAgent(scanTarget: ScanTarget, radius: number): string {
        let result = mobs.near(getTargetSelector(scanTarget), agent.getPosition(), radius)
        return "" + result
    }

    /**
     * 특정 좌표 주변에서 엔티티를 감지합니다.
     */
    //% blockId=ai_scan_near_position
    //% block="좌표 $pos 주변 반경 $radius 칸에서 $scanTarget 감지"
    //% pos.shadow=minecraftCreatePosition
    //% radius.defl=3 radius.min=1 radius.max=10
    //% weight=190
    export function scanNearPosition(scanTarget: ScanTarget, pos: Position, radius: number): string {
        let result = mobs.near(getTargetSelector(scanTarget), pos, radius)
        return "" + result
    }

}
