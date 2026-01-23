import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import { IconButton, Tooltip } from "@material-ui/core";
import { Tab as TabIcon, Delete as DeleteIcon } from "@material-ui/icons";
import {
  withModulesManager,
  formatMessageWithValues,
  formatMessage,
  Searcher,
  journalize,
  formatDateFromISO,
} from "@openimis/fe-core";

import { fetchMedicalLabServicesSummaries, deleteMedicalLabService } from "../actions";
import { RIGHT_MEDICALLABSERVICES_DELETE } from "../constants";
import DeleteMedicalLabServiceDialog from "./DeleteMedicalLabServiceDialog";
import MedicalLabServiceFilter from "./MedicalLabServiceFilter";

class MedicalLabServiceSearcher extends Component {
  state = {
    deleteLabService: null,
    reset: 0,
    params: {},
  };

  componentDidUpdate(prevProps) {
    if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      this.setState({ reset: this.state.reset + 1 });
    }
  }

  fetch = (params) => {
    this.setState({ params });
    this.props.fetchMedicalLabServicesSummaries(this.props.modulesManager, params);
  };

  rowIdentifier = (r) => r.uuid;

  filtersToQueryParams = (state) => {
    const prms = Object.keys(state.filters)
      .filter((contrib) => !!state.filters[contrib].filter)
      .map((contrib) => state.filters[contrib].filter);
    if (!state.beforeCursor && !state.afterCursor) {
      prms.push(`first: ${state.pageSize}`);
    }
    if (state.afterCursor) {
      prms.push(`after: "${state.afterCursor}"`);
      prms.push(`first: ${state.pageSize}`);
    }
    if (state.beforeCursor) {
      prms.push(`before: "${state.beforeCursor}"`);
      prms.push(`last: ${state.pageSize}`);
    }
    if (state.orderBy) {
      prms.push(`orderBy: ["${state.orderBy}"]`);
    }
    return prms;
  };

  headers = (filters) => {
    const h = [
      "medical.labService.code",
      "medical.labService.name",
      "medical.labService.price",
      filters?.showHistory?.value ? "medical.labService.validFrom" : null,
      filters?.showHistory?.value ? "medical.labService.validTo" : null,
    ];
    return h;
  };

  sorts = (filters) => [
    ["code", true],
    ["name", true],
    ["price", true],
    filters?.showHistory?.value ? ["validityFrom", false] : null,
    filters?.showHistory?.value ? ["validityTo", false] : null,
  ];

  deleteLabService = () => {
    const labService = this.state.deleteLabService;
    this.setState({ deleteLabService: null }, async () => {
      await this.props.deleteMedicalLabService(
        this.props.modulesManager,
        labService,
        formatMessage(this.props.intl, "medical.labService", "deleteDialog.title"),
      );
      this.fetch(this.state.params);
    });
  };

  confirmDelete = (deletedLabService) => {
    this.setState({ deleteLabService: deletedLabService });
  };

  deleteAction = (i) => {
    return !!i.validityTo || !!i.clientMutationId ? null : (
      <Tooltip title={formatMessage(this.props.intl, "medical.labService", "deleteLabService.tooltip")}>
        <IconButton onClick={() => this.confirmDelete(i)}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    );
  };

  itemFormatters = (filters) => {
    const formatters = [
      (ls) => ls.code,
      (ls) => ls.name,
      (ls) => ls.price,
      (ls) =>
        filters?.showHistory?.value
          ? formatDateFromISO(this.props.modulesManager, this.props.intl, ls.validityFrom)
          : null,
      (ls) =>
        filters?.showHistory?.value
          ? formatDateFromISO(this.props.modulesManager, this.props.intl, ls.validityTo)
          : null,
      (ls) => (
        <Tooltip title={formatMessage(this.props.intl, "medical.labService", "openNewTab")}>
          <IconButton onClick={() => this.props.onDoubleClick(ls, true)}>
            <TabIcon />
          </IconButton>
        </Tooltip>
      ),
    ];

    if (this.props.rights.includes(RIGHT_MEDICALLABSERVICES_DELETE)) {
      formatters.push(this.deleteAction);
    }
    return formatters;
  };

  rowDisabled = (selection, i) => !!i.validityTo;

  rowLocked = (selection, i) => !!i.clientMutationId;

  render() {
    const {
      intl,
      medicalLabServices,
      medicalLabServicesPageInfo,
      fetchingMedicalLabServices,
      fetchedMedicalLabServices,
      errorMedicalLabServices,
      cacheFiltersKey,
      onDoubleClick,
    } = this.props;
    const count = medicalLabServicesPageInfo.totalCount;
    return (
      <>
        <DeleteMedicalLabServiceDialog
          medicalLabService={this.state.deleteLabService}
          onConfirm={this.deleteLabService}
          onCancel={() => this.setState({ deleteLabService: null })}
        />
        <Searcher
          module="medicalLabService"
          cacheFiltersKey={cacheFiltersKey}
          FilterPane={MedicalLabServiceFilter}
          items={medicalLabServices}
          itemsPageInfo={medicalLabServicesPageInfo}
          fetchingItems={fetchingMedicalLabServices}
          fetchedItems={fetchedMedicalLabServices}
          errorItems={errorMedicalLabServices}
          tableTitle={formatMessageWithValues(intl, "medical.labService", "medicalLabServiceSummaries", {
            count,
          })}
          fetch={this.fetch}
          rowIdentifier={this.rowIdentifier}
          filtersToQueryParams={this.filtersToQueryParams}
          defaultOrderBy="code"
          headers={this.headers}
          itemFormatters={this.itemFormatters}
          sorts={this.sorts}
          rowDisabled={this.rowDisabled}
          rowLocked={this.rowLocked}
          onDoubleClick={(c) => !c.clientMutationId && onDoubleClick(c)}
          reset={this.state.reset}
        />
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  medicalLabServices: state.medical.medicalLabServicesSummaries,
  medicalLabServicesPageInfo: state.medical.medicalLabServicesPageInfo,
  fetchingMedicalLabServices: state.medical.fetchingMedicalLabServicesSummaries,
  fetchedMedicalLabServices: state.medical.fetchedMedicalLabServicesSummaries,
  errorMedicalLabServices: state.medical.errorMedicalLabServicesSummaries,
  submittingMutation: state.medical.submittingMutation,
  mutation: state.medical.mutation,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ fetchMedicalLabServicesSummaries, deleteMedicalLabService, journalize }, dispatch);

export default withModulesManager(connect(mapStateToProps, mapDispatchToProps)(injectIntl(MedicalLabServiceSearcher)));
