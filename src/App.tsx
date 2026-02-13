import { useEffect, useState } from "react";
import {
  Box, Heading, Spinner, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Text,
  Input, Button, FormControl, FormLabel, FormErrorMessage,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { fetchRecords, addRecord, deleteRecord, updateRecord } from "./services/recordService";
import { FaTrash, FaEdit } from "react-icons/fa";
import { Record } from "./domain/record";

type FormValues = {
  title: string;
  time: string;
};

function App() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  useEffect(() => {
    fetchRecords()
      .then((data) => {
        setRecords(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleOpenModal = () => {
    setEditingRecord(null);
    reset({ title: "", time: "" });
    onOpen();
  };

  const handleEditModal = (record: Record) => {
    setEditingRecord(record);
    reset({ title: record.title, time: record.time });
    onOpen();
  };

  const handleDelete = (id: string) => {
    deleteRecord(id)
      .then(() => fetchRecords())
      .then((data) => {
        setRecords(data);
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  const onSubmit = (data: FormValues) => {
    const action = editingRecord
      ? updateRecord(editingRecord.id, data.title, data.time)
      : addRecord(data.title, data.time);

    action
      .then(() => {
        reset({ title: "", time: "" });
        setEditingRecord(null);
        onClose();
        return fetchRecords();
      })
      .then((fetchedData) => {
        setRecords(fetchedData);
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  return (
    <Box p={10}>
      <Heading mb={4}>学習記録アプリ</Heading>

      <Button colorScheme="teal" mb={6} onClick={handleOpenModal}>
        新規登録
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingRecord ? "記録編集" : "学習記録の登録"}</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody>
              <FormControl isInvalid={!!errors.title} mb={4}>
                <FormLabel>学習内容</FormLabel>
                <Input
                  placeholder="例: TypeScript"
                  {...register("title", {
                    required: "内容の入力は必須です",
                  })}
                />
                <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.time}>
                <FormLabel>学習時間(時間)</FormLabel>
                <Input
                  type="number"
                  placeholder="例: 2"
                  {...register("time", {
                    required: "時間の入力は必須です",
                    min: {
                      value: 0,
                      message: "時間は0以上である必要があります",
                    },
                  })}
                />
                <FormErrorMessage>{errors.time?.message}</FormErrorMessage>
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                キャンセル
              </Button>
              <Button colorScheme="teal" type="submit">
                {editingRecord ? "保存" : "登録"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
          <Spinner size="xl" color="teal.500" thickness="4px" />
        </Box>
      ) : error ? (
        <Text color="red.500">エラーが発生しました: {error}</Text>
      ) : (
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>学習内容</Th>
                <Th>学習時間(時間)</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {records.map((record) => (
                <Tr key={record.id}>
                  <Td>{record.title}</Td>
                  <Td>{record.time}</Td>
                  <Td>
                    <Button
                      colorScheme="teal"
                      size="sm"
                      mr={2}
                      onClick={() => handleEditModal(record)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      colorScheme="red"
                      size="sm"
                      onClick={() => handleDelete(record.id)}
                    >
                      <FaTrash />
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default App;
