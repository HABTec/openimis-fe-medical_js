import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";

import {
  formatMessageWithValues,
  withModulesManager,
  withHistory,
  historyPush,
  ErrorBoundary,
  Helmet,
} from "@openimis/fe-core";

import MedicalLabServiceForm from "../components/MedicalLabServiceForm";
import { createMedicalLabService, updateMedicalLabService, fetchMedicalLabService } from "../actions";
import {
  RIGHT_MEDICALLABSERVICES,
  RIGHT_MEDICALLABSERVICES_ADD,
  RIGHT_MEDICALLABSERVICES_EDIT,
} from "../constants";

const styles = (theme) => ({
  page: theme.page,
});

class MedicalLabServicePage extends Component {
  componentDidMount() {
    this.ensureDetailLoaded(null, this.props);
  }

  componentDidUpdate(prevProps) {
    this.ensureDetailLoaded(prevProps, this.props);
  }

  ensureDetailLoaded = (prevProps, currentProps) => {
    const {
      medicalLabServiceId,
      modulesManager,
      rights,
      fetchMedicalLabService: fetchDetail,
      medicalLabService,
    } = currentProps;

    if (!medicalLabServiceId) {
      return;
    }

    const hadId = prevProps?.medicalLabServiceId;
    const rightsChanged = !!prevProps && prevProps.rights !== rights;
    const needsData = !medicalLabService || medicalLabService.uuid !== medicalLabServiceId;
    const idChanged = medicalLabServiceId !== hadId;

    if (!needsData && !idChanged) {
      return;
    }

    const canRequest =
      rights.includes(RIGHT_MEDICALLABSERVICES) ||
      rights.includes(RIGHT_MEDICALLABSERVICES_EDIT) ||
      rights.includes(RIGHT_MEDICALLABSERVICES_ADD);

    if (!canRequest) {
      return;
    }

    if (idChanged || rightsChanged || needsData) {
      fetchDetail(modulesManager, medicalLabServiceId);
    }
  };

  add = () => {
    historyPush(this.props.modulesManager, this.props.history, "medical.medicalLabServiceNew");
  };

  save = (medicalLabService) => {
    if (!medicalLabService.uuid) {
      this.props.createMedicalLabService(
        this.props.modulesManager,
        medicalLabService,
        formatMessageWithValues(this.props.intl, "medical.labService", "createMedicalLabService.mutationLabel"),
      );
    } else {
      this.props.updateMedicalLabService(
        this.props.modulesManager,
        medicalLabService,
        formatMessageWithValues(this.props.intl, "medical.labService", "update.mutationLabel"),
      );
    }
  };

  render() {
    const {
      classes,
      rights,
      medicalLabServiceId,
      overview,
      readOnly: propReadOnly = false,
      modulesManager,
      history,
      actions,
    } = this.props;

    const canView = rights.includes(RIGHT_MEDICALLABSERVICES);
    const canEdit = rights.includes(RIGHT_MEDICALLABSERVICES_EDIT);
    const canAdd = rights.includes(RIGHT_MEDICALLABSERVICES_ADD);
    const isNew = !medicalLabServiceId;

    if (!canView && !canEdit && !canAdd) {
      return null;
    }

      const effectiveReadOnly = propReadOnly || (isNew ? !(canAdd || canEdit) : !canEdit);

    const allowAddAction = canAdd && !effectiveReadOnly ? this.add : null;
    return (
      <div className={classes.page}>
        <Helmet title={formatMessageWithValues(this.props.intl, "medical.labService", "labServiceTitle")} />
        <ErrorBoundary>
          <MedicalLabServiceForm
            overview={overview}
            readOnly={effectiveReadOnly}
            medicalLabServiceId={medicalLabServiceId}
            back={() => historyPush(modulesManager, history, "medical.medicalLabServices")}
            actions={actions}
            add={allowAddAction}
            save={this.save}
          />
        </ErrorBoundary>
      </div>
    );
  }
}

const mapStateToProps = (state, props) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  medicalLabService: state.medical.medicalLabService,
  userId: props.match.params.user_id,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ createMedicalLabService, updateMedicalLabService, fetchMedicalLabService }, dispatch);

export default withHistory(
  withModulesManager(
    connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(MedicalLabServicePage)))),
  ),
);
