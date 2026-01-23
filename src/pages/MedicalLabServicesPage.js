import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { Fab } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { withTheme, withStyles } from "@material-ui/core/styles";

import { RIGHT_MEDICALLABSERVICES_ADD, LAB_SERVICES_MODULE_NAME } from "../constants";
import {
  formatMessage,
  formatMessageWithValues,
  Helmet,
  historyPush,
  withHistory,
  withModulesManager,
  withTooltip,
  clearCurrentPaginationPage,
} from "@openimis/fe-core";

import MedicalLabServiceSearcher from "../components/MedicalLabServiceSearcher";

const styles = (theme) => ({
  page: theme.page,
  fab: theme.fab,
});

class MedicalLabServicesPage extends Component {
  onDoubleClick = (ls, newTab = false) => {
    historyPush(this.props.modulesManager, this.props.history, "medical.medicalLabServiceOverview", [ls.uuid], newTab);
  };

  onAdd = () => {
    historyPush(this.props.modulesManager, this.props.history, "medical.medicalLabServiceNew");
  };

  componentDidMount = () => {
    const { module } = this.props;
    if (module !== LAB_SERVICES_MODULE_NAME) this.props.clearCurrentPaginationPage();
  };

  render() {
    const { classes, rights, intl } = this.props;
    return (
      <div className={classes.page}>
        <Helmet title={formatMessageWithValues(this.props.intl, "medical.labService", "labServicesTitle")} />
        <MedicalLabServiceSearcher
          cacheFiltersKey="medicalLabServicesPageFiltersCache"
          onDoubleClick={this.onDoubleClick}
        />
        {rights.includes(RIGHT_MEDICALLABSERVICES_ADD) &&
          withTooltip(
            <div className={classes.fab}>
              <Fab color="primary" onClick={this.onAdd}>
                <AddIcon />
              </Fab>
            </div>,
            formatMessage(intl, "medical.labService", "addNewMedicalLabService.tooltip"),
          )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  module: state.core?.savedPagination?.module,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ clearCurrentPaginationPage }, dispatch);

export default injectIntl(
  withModulesManager(
    withHistory(connect(mapStateToProps, mapDispatchToProps)(withTheme(withStyles(styles)(MedicalLabServicesPage)))),
  ),
);
