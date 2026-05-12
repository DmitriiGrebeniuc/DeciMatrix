import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../../constants/colors';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

type CriterionCardProps = {
  name: string;
  onDelete?: () => void;
};

export function CriterionCard({ name, onDelete }: CriterionCardProps) {
  return (
    <Card>
      <View style={styles.row}>
        <Text style={styles.name}>{name}</Text>
        {onDelete ? (
          <View style={styles.action}>
            <Button title="Удалить" variant="danger" onPress={onDelete} />
          </View>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  name: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  action: {
    minWidth: 112,
  },
});
