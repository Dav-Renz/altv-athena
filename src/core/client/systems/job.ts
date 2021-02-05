import * as alt from 'alt-client';
import JobEnums, { Objective } from '../../shared/interfaces/Job';
import { isFlagEnabled } from '../../shared/utility/flags';
import { distance } from '../../shared/utility/vector';
import { drawMarker } from '../utility/marker';
import { drawText3D } from '../utility/text';
import { BaseHUD } from '../views/hud/hud';

class ObjectiveController {
    static objective: Objective | null;
    static interval: number;
    static cooldown: number;

    static handleSync(data: Objective | null) {
        if (ObjectiveController.interval) {
            alt.clearInterval(ObjectiveController.interval);
        }

        if (!data) {
            ObjectiveController.objective = null;
            BaseHUD.updateObjective(null);
            return;
        }

        BaseHUD.updateObjective(data.description);
        ObjectiveController.objective = data;
        ObjectiveController.interval = alt.setInterval(ObjectiveController.verifyObjective, 0);
    }

    private static getVector3Range() {
        return new alt.Vector3(
            ObjectiveController.objective.range,
            ObjectiveController.objective.range,
            ObjectiveController.objective.range
        );
    }

    private static verifyType(dist: number): boolean {
        if (isFlagEnabled(ObjectiveController.objective.type, JobEnums.ObjectiveType.WAYPOINT)) {
            if (dist <= ObjectiveController.objective.range) {
                return true;
            }
        }

        if (isFlagEnabled(ObjectiveController.objective.type, JobEnums.ObjectiveType.CAPTURE_POINT)) {
            if (dist <= ObjectiveController.objective.range) {
                return true;
            }
        }

        return false;
    }

    private static verifyCriteria(dist: number): boolean {
        if (isFlagEnabled(ObjectiveController.objective.criteria, JobEnums.ObjectiveCriteria.NO_VEHICLE)) {
            if (alt.Player.local.vehicle) {
                return false;
            }
        }

        return true;
    }

    private static verifyObjective() {
        if (alt.Player.local.isMenuOpen) {
            return;
        }

        if (!ObjectiveController.objective) {
            return;
        }

        const dist = distance(alt.Player.local.pos, ObjectiveController.objective.pos);

        if (ObjectiveController.objective.marker && dist <= ObjectiveController.objective.range * 25) {
            drawMarker(
                1,
                ObjectiveController.objective.marker.pos as alt.Vector3,
                ObjectiveController.getVector3Range(),
                ObjectiveController.objective.marker.color
            );
        }

        if (ObjectiveController.objective.textLabel && dist <= ObjectiveController.objective.range * 10) {
            drawText3D(
                ObjectiveController.objective.textLabel.data,
                ObjectiveController.objective.textLabel.pos as alt.Vector3,
                0.4,
                new alt.RGBA(255, 255, 255, 255)
            );
        }

        if (ObjectiveController.cooldown && Date.now() < ObjectiveController.cooldown) {
            return;
        }

        ObjectiveController.cooldown = Date.now() + 250;

        if (!ObjectiveController.verifyType(dist)) {
            return;
        }

        if (!ObjectiveController.verifyCriteria(dist)) {
            return;
        }

        alt.emitServer(JobEnums.ObjectiveEvents.JOB_VERIFY);
    }
}

alt.onServer(JobEnums.ObjectiveEvents.JOB_SYNC, ObjectiveController.handleSync);
