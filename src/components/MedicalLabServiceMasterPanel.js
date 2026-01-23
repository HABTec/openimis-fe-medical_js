import React from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";

import { withStyles, withTheme } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core";

import { AmountInput, FormPanel, PublishedComponent, TextInput, withHistory, withModulesManager } from "@openimis/fe-core";

const styles = (theme) => ({
  item: theme.paper.item,
});

class MedicalLabServiceMasterPanel extends FormPanel {
  render() {
    const { classes, edited, readOnly } = this.props;
    return (
      <>
        <Grid container className={classes.item}>
          <Grid item xs={2} className={classes.item}>
            <TextInput
              module="admin"
              label="medical.labService.code"
              required
              readOnly={readOnly}
              value={edited?.code ?? ""}
              onChange={(code) => this.updateAttribute("code", code)}
            />
          </Grid>
          <Grid item xs={7} className={classes.item}>
            <TextInput
              module="admin"
              label="medical.labService.name"
              required
              readOnly={readOnly}
              value={edited?.name ?? ""}
              onChange={(name) => this.updateAttribute("name", name)}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <AmountInput
              module="admin"
              label="medical.labService.price"
              required
              name="price"
              readOnly={readOnly}
              value={edited?.price ?? ""}
              onChange={(price) => this.updateAttribute("price", price)}
            />
          </Grid>
        </Grid>
        <Grid container className={classes.item}>
          <Grid item xs={6} className={classes.item}>
            <PublishedComponent
              pubRef="medical.CareTypePicker"
              withNull={false}
              required
              readOnly={Boolean(edited?.id) || readOnly}
              value={edited?.careType ?? " "}
              onChange={(careType) => this.updateAttribute("careType", careType)}
            />
          </Grid>
          <Grid item xs={6} className={classes.item}>
            <PublishedComponent
              pubRef="medical.PatientCategoryPicker"
              readOnly={Boolean(edited?.id) || readOnly}
              value={edited?.patientCategory ?? ""}
              onChange={(patientCategory) => this.updateAttribute("patientCategory", patientCategory)}
            />
          </Grid>
        </Grid>
      </>
    );
  }
}

const mapStateToProps = () => ({
  rights: [],
});

export default injectIntl(
  withModulesManager(withHistory(connect(mapStateToProps)(withTheme(withStyles(styles)(MedicalLabServiceMasterPanel))))),
);
