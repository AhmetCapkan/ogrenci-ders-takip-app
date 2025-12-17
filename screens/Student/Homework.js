import { StyleSheet, Text, View, FlatList, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { db, auth } from '../../firebaseConfig';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

export default function Homework() {
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "homeworks"),
      where("studentId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const hwData = [];
      snapshot.forEach((doc) => {
        hwData.push({ id: doc.id, ...doc.data() });
      });
      setHomeworks(hwData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const renderHomework = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        setSelectedHomework(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.cardRow}>
        <Text style={styles.subjectText}>{item.subjectName}</Text>
        <Text style={styles.teacherText}>👨‍🏫 {item.teacherName}</Text>
      </View>
      <Text style={styles.topicText}>📘 {item.topic}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Ödevler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {homeworks.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 16, color: "#666" }}>Henüz ödeviniz bulunmuyor 📭</Text>
        </View>
      ) : (
        <FlatList
          data={homeworks}
          renderItem={renderHomework}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* Modal Detay */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedHomework && (
              <>
                <Text style={styles.modalTitle}>{selectedHomework.subjectName}</Text>
                <Text style={styles.modalTopic}>📘 {selectedHomework.topic}</Text>
                <Text style={styles.modalInfo}>👨‍🏫 Öğretmen: {selectedHomework.teacherName}</Text>
                <Text style={styles.modalInfo}>⏰ Süre: {selectedHomework.studyTime}</Text>
                <Text style={styles.modalInfo}>
                  🗓️ Tarih:{" "}
                  {selectedHomework.createdAt?.toDate
                    ? selectedHomework.createdAt.toDate().toLocaleString("tr-TR")
                    : "Bilinmiyor"}
                </Text>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Kapat</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f5f9',
    padding: 15,
    marginTop: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subjectText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  teacherText: {
    fontSize: 14,
    color: '#666',
  },
  topicText: {
    marginTop: 8,
    fontSize: 15,
    color: '#555',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 10,
  },
  modalTopic: {
    fontSize: 16,
    color: '#444',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalInfo: {
    fontSize: 15,
    color: '#555',
    marginVertical: 2,
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
