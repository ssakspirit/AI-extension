// @ts-nocheck
//% color=#1E90FF weight=100 icon="\uf544"
//% block="AI"
namespace ai {

    /**
     * 감지 기준 위치
     */
    export const enum ScanCenter {
        //% block="에이전트"
        Agent = 0,
        //% block="플레이어"
        Player = 1
    }

    /**
     * 감지할 대상 종류
     */
    export const enum ScanTarget {
        //% block="플레이어"
        Player = 0,
        //% block="몬스터"
        Monster = 1,
        //% block="몹"
        Mob = 2,
        //% block="전체"
        All = 3
    }

    /**
     * 에이전트 주변 반경 N칸 안의 엔티티 이름 목록을 반환합니다.
     * 에이전트 자신은 제외됩니다.
     * 반환값 예시: "lees", "lees, Zombie", "없음"
     */
    /**
     * TargetSelector를 텍스트로 변환합니다.
     */
    //% blockId=ai_selector_to_text
    //% block="$sel 텍스트로 변환"
    //% weight=190
    export function selectorToText(sel: TargetSelector): string {
        return "" + sel
    }

    /**
     * 특정 이름의 엔티티가 특정 아이템을 소지하고 있는지 확인합니다.
     * itemId 예시: "diamond", "iron_sword", "bow"
     */
    //% blockId=ai_entity_has_item
    //% block="$scanCenter 주변 반경 $radius 칸에서 $name 이(가) $itemId 소지"
    //% radius.defl=3 radius.min=1 radius.max=10
    //% weight=185
    export function entityHasItem(scanCenter: ScanCenter, name: string, radius: number, itemId: string): boolean {
        // 신호 블록 초기화
        player.execute("setblock 1000 5 1000 air 0 destroy")
        // 에이전트 또는 플레이어 기준으로 체크
        if (scanCenter == ScanCenter.Agent) {
            player.execute("execute @e[type=agent] ~~~ execute @e[name=" + name + ",r=" + radius + ",hasitem={item=" + itemId + "}] ~~~ setblock 1000 5 1000 stone")
        } else {
            player.execute("execute @e[name=" + name + ",r=" + radius + ",hasitem={item=" + itemId + "}] ~~~ setblock 1000 5 1000 stone")
        }
        return blocks.testForBlock(Block.Stone, world(1000, 5, 1000))
    }

    //% blockId=ai_scan_near
    //% block="$scanCenter 주변 반경 $radius 칸에서 $scanTarget 최대 $count 개 감지"
    //% radius.defl=3 radius.min=1 radius.max=10
    //% count.defl=1 count.min=1 count.max=10
    //% weight=200
    export function scanNear(scanCenter: ScanCenter, scanTarget: ScanTarget, radius: number, count: number): TargetSelector {
        let pos = scanCenter == ScanCenter.Player ? player.position() : agent.getPosition()
        let sel = mobs.near(mobs.target(ALL_ENTITIES), pos, radius)
        if (scanTarget == ScanTarget.Player) {
            sel = mobs.near(mobs.target(ALL_PLAYERS), pos, radius)
        } else if (scanTarget == ScanTarget.Monster) {
            sel.addRule("family", "monster")
        } else if (scanTarget == ScanTarget.Mob) {
            sel.addRule("family", "mob")
        }
        sel.addRule("c", "" + count)
        return sel
    }

}
