import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { Edit as EditIcon } from "@material-ui/icons";
import {
  ErrorBoundary,
  formatMessageWithValues,
  Helmet,
  historyPush,
  withHistory,
  withModulesManager,
} from "@openimis/fe-core";
import MedicalLabServicePage from "./MedicalLabServicePage";

class MedicalLabServiceOverviewPage extends Component {
  render() {
    const { history, modulesManager, medicalLabServiceId } = this.props;
    const actions = [
      {
        doIt: () => historyPush(modulesManager, history, "medical.medicalLabServiceOverview", [medicalLabServiceId]),
        icon: <EditIcon />,
        onlyIfDirty: false,
      },
    ];
    return (
      <ErrorBoundary>
        <Helmet title={formatMessageWithValues(this.props.intl, "medical.labService", "overviewTitle")} />
        <MedicalLabServicePage {...this.props} overview={true} actions={actions} />
      </ErrorBoundary>
    );
  }
}

const mapStateToProps = (state, props) => ({
  medicalLabServiceId: props.match.params.medical_lab_service_id,
});

export default withHistory(withModulesManager(connect(mapStateToProps)(injectIntl(MedicalLabServiceOverviewPage))));
